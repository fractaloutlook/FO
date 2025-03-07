import React, { useState, useEffect } from 'react';
import { bigIntToDate } from '../utils/bigint-utils';

const PollSystem = ({ connection, isAdmin }) => {
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  // For creating new polls (admin only)
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState(30); // minutes
  
  useEffect(() => {
    if (connection) {
      // Check if poll tables exist
      const hasPollTables = connection.db.poll && connection.db.pollOption && connection.db.pollVote;
      if (!hasPollTables) {
        console.log("Poll tables are not available yet");
        return;
      }

      // Load existing polls
      if (connection.db.poll) {
        const pollsData = Array.from(connection.db.poll.iter());
        setPolls(pollsData);
        
        // Find the most recent active poll
        const active = pollsData.find(p => p.active);
        if (active) {
          // Load options for this poll
          const options = Array.from(connection.db.pollOption.iter()).filter(o => o.pollId === active.pollId);
          // Get vote counts
          const votes = Array.from(connection.db.pollVote.iter()).filter(v => v.pollId === active.pollId);
          // Attach options and votes to the active poll
          setActivePoll({
            ...active,
            options,
            votes
          });
        }
      }
      
      // Set up listeners for updates
      connection.db.poll?.onInsert?.((ctx, poll) => {
        setPolls(prev => [...prev, poll]);
        if (poll.active) {
          setActivePoll(poll);
        }
      });
      
      connection.db.poll?.onUpdate?.((ctx, oldPoll, newPoll) => {
        setPolls(prev => prev.map(p => p.pollId === newPoll.pollId ? newPoll : p));
        if (activePoll?.pollId === newPoll.pollId) {
          if (!newPoll.active) {
            setActivePoll(null);
          } else {
            setActivePoll(prev => ({ ...prev, ...newPoll }));
          }
        }
      });
      
      connection.db.pollVote?.onInsert?.((ctx, vote) => {
        if (activePoll?.pollId === vote.pollId) {
          setActivePoll(prev => ({
            ...prev,
            votes: [...(prev.votes || []), vote]
          }));
        }
      });
    }
  }, [connection]);
  
  // Update time remaining for active poll
  useEffect(() => {
    if (activePoll?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const expiry = bigIntToDate(activePoll.expiresAt);
        const diff = expiry - now;
        if (diff <= 0) {
          setTimeRemaining('Ended');
          clearInterval(interval);
        } else {
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}m ${seconds}s remaining`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activePoll]);
  
  const handleVote = () => {
    if (!selectedOption || !activePoll || !connection) return;
    try {
      connection.reducers.voteOnPoll(activePoll.pollId, selectedOption);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };
  
  const handleAddOption = () => {
    setNewOptions([...newOptions, '']);
  };
  
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  };
  
  const handleCreatePoll = () => {
    if (!newQuestion.trim() || !connection) return;
    const validOptions = newOptions.filter(o => o.trim() !== '');
    if (validOptions.length < 2) return;
    try {
      connection.reducers.createPoll(newQuestion, validOptions, pollDuration);
      setNewQuestion('');
      setNewOptions(['', '']);
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };
  
  // Helper function to calculate vote percentages
  const getVotePercentages = () => {
    if (!activePoll?.votes || !activePoll?.options) return {};
    const counts = {};
    activePoll.options.forEach(option => {
      counts[option.optionId] = 0;
    });
    activePoll.votes.forEach(vote => {
      counts[vote.optionId] = (counts[vote.optionId] || 0) + 1;
    });
    const total = activePoll.votes.length;
    const percentages = {};
    Object.keys(counts).forEach(optionId => {
      percentages[optionId] = total ? Math.round((counts[optionId] / total) * 100) : 0;
    });
    return { counts, percentages, total };
  };
  
  const { counts, percentages, total } = getVotePercentages();
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Option 1: Center header */}
      {/*<h3 className="text-center font-medium text-gray-900 mb-2">C?</h3>*/}
      {/* Option 2: Remove header entirely */}
      <h3 className="sr-only">C?</h3>
      
      {activePoll ? (
        <div>
          <h4 className="text-lg font-medium mb-2">{activePoll.question}</h4>
          {timeRemaining && (
            <p className="text-sm text-blue-600 mb-3">{timeRemaining}</p>
          )}
          <div className="space-y-3 mb-4">
            {activePoll.options?.map(option => {
              const count = counts?.[option.optionId] || 0;
              const percent = percentages?.[option.optionId] || 0;
              return (
                <div key={option.optionId} className="relative">
                  <div 
                    className={`p-3 rounded cursor-pointer ${
                      selectedOption === option.optionId
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50'
                    }`}
                    onClick={() => setSelectedOption(option.optionId)}
                  >
                    <div className="flex justify-between">
                      <span className="text-sm">{option.text}</span>
                      <span className="text-gray-600 text-sm">
                        {count} votes ({percent}%)
                      </span>
                    </div>
                    <div className="h-1 w-full bg-gray-200 mt-2">
                      <div 
                        className="h-1 bg-blue-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-sm text-gray-600 mb-4">Total votes: {total || 0}</div>
          <button
            onClick={handleVote}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 text-sm"
            disabled={selectedOption === null}
          >
            Submit Vote
          </button>
          {isAdmin && (
            <button
              onClick={() => connection?.reducers?.manuallyClosePoll(activePoll.pollId)}
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              End Poll
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-600 italic mb-4">No active polls at the moment.</p>
      )}
      
      {isAdmin && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Create New Poll</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Question:</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="Enter poll question..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Options:</label>
              {newOptions.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full p-2 border rounded mb-2 text-sm"
                  placeholder={`Option ${index + 1}`}
                />
              ))}
              <button
                onClick={handleAddOption}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Another Option
              </button>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Duration (minutes):</label>
              <input
                type="number"
                value={pollDuration}
                onChange={(e) => setPollDuration(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded text-sm"
                min="1"
                max="1440"
              />
            </div>
            <button
              onClick={handleCreatePoll}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Create Poll
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollSystem;
